import { REACTION_MATRIX, CHEMICALS } from '@/lib/constants';

export interface Chemical {
  id: string;
  formula: string;
  name: string;
  amount: number; // in moles
  concentration?: number; // mol/L
  temperature: number; // Celsius
  state: 'solid' | 'liquid' | 'gas' | 'aqueous';
  color: string;
  ph?: number;
}

export interface ReactionResult {
  occurred: boolean;
  products: Chemical[];
  heatReleased: number;
  animation?: string;
  message?: string;
}

export class ChemistryCore {
  private chemicals: Map<string, Chemical> = new Map();
  private reactions: string[] = [];

  /**
   * Add chemical to the system
   */
  addChemical(formula: string, amount: number = 1, temperature: number = 25): string {
    const chemData = CHEMICALS[formula as keyof typeof CHEMICALS];
    
    if (!chemData) {
      throw new Error(`Unknown chemical: ${formula}`);
    }

    const id = `chem_${Date.now()}_${Math.random()}`;
    const chemical: Chemical = {
      id,
      formula,
      name: chemData.name,
      amount,
      temperature,
      state: chemData.state as any,
      color: chemData.color,
      ph: chemData.ph,
    };

    this.chemicals.set(id, chemical);
    return id;
  }

  /**
   * Mix two chemicals
   */
  mixChemicals(id1: string, id2: string): ReactionResult {
    const chem1 = this.chemicals.get(id1);
    const chem2 = this.chemicals.get(id2);

    if (!chem1 || !chem2) {
      return {
        occurred: false,
        products: [],
        heatReleased: 0,
        message: 'One or both chemicals not found',
      };
    }

    // Create reaction key (order-independent)
    const reactionKey1 = `${chem1.formula}+${chem2.formula}`;
    const reactionKey2 = `${chem2.formula}+${chem1.formula}`;

    const reactionData =
      REACTION_MATRIX[reactionKey1 as keyof typeof REACTION_MATRIX] ||
      REACTION_MATRIX[reactionKey2 as keyof typeof REACTION_MATRIX];

    if (!reactionData) {
      // No reaction occurs - just mix physically
      return {
        occurred: false,
        products: [chem1, chem2],
        heatReleased: 0,
        message: 'No chemical reaction occurs. Physical mixture formed.',
      };
    }

    // Reaction occurs!
    this.reactions.push(`${chem1.formula} + ${chem2.formula} → ${reactionData.product}`);

    // Calculate temperature change
    const totalMass = chem1.amount + chem2.amount;
    const avgTemp = (chem1.temperature + chem2.temperature) / 2;
    const newTemp = avgTemp + reactionData.heat;

    // Parse products
    const productFormulas = reactionData.product.split('+');
    const products: Chemical[] = productFormulas.map((formula, idx) => {
      const trimmedFormula = formula.trim();
      const chemData = CHEMICALS[trimmedFormula as keyof typeof CHEMICALS];

      return {
        id: `product_${Date.now()}_${idx}`,
        formula: trimmedFormula,
        name: chemData?.name || reactionData.name,
        amount: totalMass,
        temperature: newTemp,
        state: 'liquid' as any,
        color: reactionData.color,
        ph: 7, // Neutral for salt solutions
      };
    });

    // Remove original chemicals
    this.chemicals.delete(id1);
    this.chemicals.delete(id2);

    // Add products
    products.forEach((p) => this.chemicals.set(p.id, p));

    return {
      occurred: true,
      products,
      heatReleased: reactionData.heat,
      animation: reactionData.animation,
      message: `Reaction: ${chem1.formula} + ${chem2.formula} → ${reactionData.product}`,
    };
  }

  /**
   * Get all chemicals in the system
   */
  getAllChemicals(): Chemical[] {
    return Array.from(this.chemicals.values());
  }

  /**
   * Get chemical by ID
   */
  getChemical(id: string): Chemical | undefined {
    return this.chemicals.get(id);
  }

  /**
   * Remove chemical
   */
  removeChemical(id: string): boolean {
    return this.chemicals.delete(id);
  }

  /**
   * Calculate pH of mixture
   */
  calculateMixturePH(chemicalIds: string[]): number {
    if (chemicalIds.length === 0) return 7;

    let totalH = 0;
    let totalOH = 0;

    chemicalIds.forEach((id) => {
      const chem = this.chemicals.get(id);
      if (chem && chem.ph !== undefined) {
        if (chem.ph < 7) {
          // Acidic: calculate H+ concentration
          totalH += Math.pow(10, -chem.ph) * chem.amount;
        } else if (chem.ph > 7) {
          // Basic: calculate OH- concentration
          totalOH += Math.pow(10, -(14 - chem.ph)) * chem.amount;
        }
      }
    });

    // Net H+ concentration
    const netH = totalH - totalOH;
    
    if (Math.abs(netH) < 1e-10) return 7; // Neutral
    if (netH > 0) return -Math.log10(netH); // Acidic
    return 14 + Math.log10(-netH); // Basic
  }

  /**
   * Calculate average temperature
   */
  calculateAverageTemperature(chemicalIds: string[]): number {
    if (chemicalIds.length === 0) return 25;

    let totalTemp = 0;
    let totalMass = 0;

    chemicalIds.forEach((id) => {
      const chem = this.chemicals.get(id);
      if (chem) {
        totalTemp += chem.temperature * chem.amount;
        totalMass += chem.amount;
      }
    });

    return totalMass > 0 ? totalTemp / totalMass : 25;
  }

  /**
   * Get reaction history
   */
  getReactionHistory(): string[] {
    return [...this.reactions];
  }

  /**
   * Clear all chemicals
   */
  clear() {
    this.chemicals.clear();
    this.reactions = [];
  }

  /**
   * Reset system
   */
  reset() {
    this.clear();
  }

  /**
   * Simulate titration
   */
  simulateTitration(
    acidId: string,
    baseId: string,
    baseVolume: number
  ): {
    ph: number;
    neutralized: boolean;
    color: string;
  } {
    const acid = this.chemicals.get(acidId);
    const base = this.chemicals.get(baseId);

    if (!acid || !base) {
      return { ph: 7, neutralized: false, color: '#e5e7eb' };
    }

    // Simple titration calculation
    const acidAmount = acid.amount;
    const baseAmount = (baseVolume / 1000) * (base.concentration || 1);

    const ratio = baseAmount / acidAmount;

    let ph: number;
    let color: string;
    let neutralized = false;

    if (ratio < 0.9) {
      // Excess acid
      ph = 2 + ratio * 3;
      color = '#ef4444'; // Red
    } else if (ratio < 1.1) {
      // Near equivalence point
      ph = 7;
      color = '#4ade80'; // Green
      neutralized = true;
    } else {
      // Excess base
      ph = 7 + (ratio - 1) * 5;
      color = '#3b82f6'; // Blue
    }

    return { ph, neutralized, color };
  }

  /**
   * Simulate gas law (PV = nRT)
   */
  simulateGasLaw(
    volume: number,
    temperature: number,
    moles: number = 1
  ): {
    pressure: number;
    unit: string;
  } {
    const R = 8.314; // J/(mol·K)
    const T = temperature + 273.15; // Convert to Kelvin
    const V = volume / 1000; // Convert mL to L

    // P = nRT / V (in Pa)
    const pressure = (moles * R * T) / V;

    // Convert to atm for readability
    const pressureAtm = pressure / 101325;

    return {
      pressure: parseFloat(pressureAtm.toFixed(3)),
      unit: 'atm',
    };
  }
}

export default ChemistryCore;