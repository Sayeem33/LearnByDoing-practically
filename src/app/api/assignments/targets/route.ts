import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Tutorial from '@/models/Tutorial';
import ConceptDefinition from '@/models/ConceptDefinition';
import { EXPERIMENT_TEMPLATES } from '@/lib/constants';
import { formatClassLabel, getStudentClassKey } from '@/lib/assignmentAnalytics';
import { RBAC_POLICY, requireRoles } from '@/lib/rbac';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireRoles(request, RBAC_POLICY.assignments.targets);
    if ('response' in auth) {
      return auth.response;
    }

    await dbConnect();

    const students = await User.find({ role: 'student' })
      .select('_id name email institution grade')
      .sort({ name: 1 });
    const tutorials = await Tutorial.find({})
      .select('experimentId experimentName category')
      .sort({ experimentName: 1 });
    const authoredDefinitions = await ConceptDefinition.find({ isPublished: true })
      .select('conceptId name category')
      .sort({ name: 1 });

    const classesMap = new Map<string, { key: string; label: string; studentCount: number }>();

    students.forEach((student) => {
      const classKey = getStudentClassKey(student);
      if (!classKey) return;

      const existing = classesMap.get(classKey) || {
        key: classKey,
        label: formatClassLabel(classKey),
        studentCount: 0,
      };
      existing.studentCount += 1;
      classesMap.set(classKey, existing);
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          students: students.map((student) => ({
            id: student._id.toString(),
            name: student.name,
            email: student.email,
            classKey: getStudentClassKey(student),
            classLabel: getStudentClassKey(student)
              ? formatClassLabel(getStudentClassKey(student)!)
              : 'No class assigned',
          })),
          classes: Array.from(classesMap.values()).sort((a, b) => a.label.localeCompare(b.label)),
          labs: Object.entries(EXPERIMENT_TEMPLATES).map(([id, template]) => ({
            id,
            name: template.name,
            category: template.category,
          })).concat(
            authoredDefinitions.map((definition) => ({
              id: definition.conceptId,
              name: definition.name,
              category: definition.category,
            }))
          ),
          tutorials: tutorials.map((tutorial) => ({
            id: tutorial.experimentId,
            name: tutorial.experimentName,
            category: tutorial.category,
          })),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/assignments/targets error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load assignment targets' },
      { status: 500 }
    );
  }
}
