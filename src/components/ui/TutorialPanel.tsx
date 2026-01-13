'use client';

import React from 'react';
import Card from '@/components/ui/Card';

export default function TutorialPanel({ title, theory, steps, commonMistakes }: any) {
  return (
    <Card>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <div className="text-sm text-gray-700 mb-2">{theory}</div>
      <div className="mb-2">
        <strong>Steps</strong>
        <ol className="list-decimal list-inside ml-3 text-sm">
          {steps?.map((s: string, i: number) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </div>
      {commonMistakes && (
        <div>
          <strong>Common Mistakes</strong>
          <ul className="list-disc list-inside ml-3 text-sm">
            {commonMistakes.map((m: string, i: number) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
