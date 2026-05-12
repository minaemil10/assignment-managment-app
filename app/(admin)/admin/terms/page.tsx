"use client";

import { useState, useEffect } from "react";
import { Term, Department } from "@/types/models";

type SortColumn = 'id' | 'level' | 'number' | 'department';

export default function TermsPage() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  
  const [number, setNumber] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [error, setError] = useState("");

  // Sorting State
  const [sortColumn, setSortColumn] = useState<SortColumn>('level');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const fetchData = async () => {
    const [termsRes, deptsRes] = await Promise.all([
      fetch("/api/terms"),
      fetch("/api/departments")
    ]);

    if (termsRes.ok) setTerms(await termsRes.json());
    if (deptsRes.ok) setDepartments(await deptsRes.json());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const termNum = Number(number);

    if (termNum <= 2 && departmentId !== "") {
      setError("Terms 1 and 2 are Preparatory and cannot belong to a specific department.");
      return;
    }

    if (termNum > 2 && departmentId === "") {
      setError(`Term ${termNum} requires a specific department. It cannot be Preparatory.`);
      return;
    }

    if (termNum > 10) {
      const confirmed = window.confirm(`Standard programs only go up to Term 10 (Level 4). Are you sure you want to create Term ${termNum}?`);
      if (!confirmed) return;
    }

    const res = await fetch("/api/terms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        number: termNum, 
        department_id: departmentId ? Number(departmentId) : null 
      }),
    });

    if (res.ok) {
      setNumber("");
      setDepartmentId("");
      fetchData(); 
    } else {
      const data = await res.json();
      setError(data.error || "Failed to add term");
    }
  };

  const getDepartmentName = (deptId: number | null) => {
    if (!deptId) return "None (Preparatory Level)";
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.name : "Unknown";
  };

  // --- SORTING LOGIC ---
  const handleSort = (col: SortColumn) => {
    if (sortColumn === col) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  const renderSortIndicator = (col: SortColumn) => {
    if (sortColumn !== col) return null;
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  const sortedTerms = [...terms].sort((a, b) => {
    let valA: string | number = '';
    let valB: string | number = '';

    if (sortColumn === 'id') {
      valA = a.id;
      valB = b.id;
    } else if (sortColumn === 'level') {
      valA = a.level;
      valB = b.level;
    } else if (sortColumn === 'number') {
      valA = a.number;
      valB = b.number;
    } else if (sortColumn === 'department') {
      valA = getDepartmentName(a.department_id);
      valB = getDepartmentName(b.department_id);
    }

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Manage Terms</h1>

      {/* The Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Term</h2>
        {error && <p className="text-red-500 mb-4 bg-red-50 p-3 rounded">{error}</p>}
        
        <form onSubmit={handleSubmit} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Term Number</label>
            <input
              type="number"
              required
              min="1"
              placeholder="e.g., 1"
              className="w-full border border-gray-300 p-2 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            />
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              className="w-full border border-gray-300 p-2 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
            >
              <option value="">None (Prep Level)</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition h-[42px]">
            Add
          </button>
        </form>
      </div>

      {/* The Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th 
                className="p-4 text-gray-700 font-semibold w-24 cursor-pointer hover:bg-gray-200 transition select-none"
                onClick={() => handleSort('id')}
              >
                ID{renderSortIndicator('id')}
              </th>
              <th 
                className="p-4 text-gray-700 font-semibold cursor-pointer hover:bg-gray-200 transition select-none"
                onClick={() => handleSort('level')}
              >
                Level{renderSortIndicator('level')}
              </th>
              <th 
                className="p-4 text-gray-700 font-semibold cursor-pointer hover:bg-gray-200 transition select-none"
                onClick={() => handleSort('number')}
              >
                Term Number{renderSortIndicator('number')}
              </th>
              <th 
                className="p-4 text-gray-700 font-semibold cursor-pointer hover:bg-gray-200 transition select-none"
                onClick={() => handleSort('department')}
              >
                Department{renderSortIndicator('department')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTerms.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No terms found. Add one above!
                </td>
              </tr>
            ) : (
              sortedTerms.map((term) => (
                <tr key={term.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 text-gray-600">#{term.id}</td>
                  <td className="p-4 font-medium text-gray-800">Level {term.level}</td>
                  <td className="p-4 font-medium text-gray-800">Term {term.number}</td>
                  <td className="p-4 text-gray-600">{getDepartmentName(term.department_id)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
