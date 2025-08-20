'use client';

import { useState, type FormEvent } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BrandSearchFormProps {
  onSubmit: (brandName: string) => void;
  isLoading: boolean;
}

export function BrandSearchForm({ onSubmit, isLoading }: BrandSearchFormProps) {
  const [brandName, setBrandName] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (brandName.trim()) {
      onSubmit(brandName.trim());
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>1. Brand Name Search</CardTitle>
        <CardDescription>Check if your brand name is already registered or similar to existing marks.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="brand-name">Brand Name</Label>
            <Input
              id="brand-name"
              placeholder="e.g., Kirimna"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              disabled={isLoading}
              required
              aria-describedby="brand-name-description"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading || !brandName.trim()}>
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Search />
            )}
            <span>Search Brand Name</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
