import { useState } from 'react';

export default function SkincareChecklist({ tasks }) {
  // This "state" keeps track of which task indexes are checked off
  const [completed, setCompleted] = useState([]);

  const toggleTask = (index) => {
    if (completed.includes(index)) {
      // If it's already checked, uncheck it
      setCompleted(completed.filter(i => i !== index));
    } else {
      // If it's not checked, add it to the completed list
      setCompleted([...completed, index]);
    }
  };

  return (
    <div className="mt-4 space-y-2">
      {tasks.map((task, index) => (
        <label 
          key={index} 
          className="flex items-center space-x-3 p-2 rounded hover:bg-green-100 cursor-pointer transition-colors"
        >
          <input
            type="checkbox"
            checked={completed.includes(index)}
            onChange={() => toggleTask(index)}
            className="w-5 h-5 text-green-600 rounded border-green-300 focus:ring-green-500 cursor-pointer"
          />
          <span className={`text-green-800 transition-all ${completed.includes(index) ? 'line-through opacity-50' : ''}`}>
            {task}
          </span>
        </label>
      ))}
    </div>
  );
}