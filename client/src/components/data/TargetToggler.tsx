import React, { useEffect, useState } from 'react';
import { useUpload } from '../../contexts/upload-context';

const TargetToggler = () => {
  const { schema, target, setTarget, fetchTechniques } = useUpload();
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    if (!schema) return;
    const numericFields = Object.entries(schema.types || {})
      .filter(([col, dtype]) => dtype.includes('float') || dtype.includes('int'))
      .map(([col]) => col);
    setOptions(numericFields);
  }, [schema]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setTarget(selected);
    fetchTechniques(selected);
  };

  if (!options.length) return null;

  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="text-sm text-zinc-600">Target:</span>
      <select
        value={target}
        onChange={handleChange}
        className="text-sm border border-zinc-300 rounded px-2 py-1 bg-white"
      >
        <option value="">— none —</option>
        {options.map((col) => (
          <option key={col} value={col}>{col}</option>
        ))}
      </select>
    </div>
  );
};

export default TargetToggler;
