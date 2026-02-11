'use client';

import { useState, useEffect } from 'react';

interface Company {
  cik: string;
  name: string;
  ticker: string;
}

interface CompanyOverviewProps {
  company: Company;
}

export default function CompanyOverview({ company }: CompanyOverviewProps) {
  const [bullets, setBullets] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/company-overview?cik=${company.cik}&company=${encodeURIComponent(company.name)}`
        );
        
        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          throw new Error('Invalid response from server. Please try again.');
        }

        if (!response.ok) {
          const errorMessage = data?.error || `Failed to fetch company overview (HTTP ${response.status})`;
          throw new Error(errorMessage);
        }

        setBullets(data.bullets || []);
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to load company overview';
        setError(errorMessage);
        console.error('Error fetching overview:', err);
      } finally {
        setLoading(false);
      }
    };

    if (company) {
      fetchOverview();
    }
  }, [company]);

  return null;
}

