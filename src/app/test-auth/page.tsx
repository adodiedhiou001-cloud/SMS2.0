'use client';

import { useState } from 'react';

export default function TestAuth() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testSignup = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'testuser',
          password: 'password123',
          email: 'test@example.com'
        }),
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Erreur: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'testuser',
          password: 'password123'
        }),
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Erreur: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Test d'Authentification</h1>
      
      <div className="space-y-4">
        <button
          onClick={testSignup}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Test en cours...' : 'Tester Signup'}
        </button>
        
        <button
          onClick={testLogin}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 ml-4"
        >
          {loading ? 'Test en cours...' : 'Tester Login'}
        </button>
      </div>

      {result && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Résultat :</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
