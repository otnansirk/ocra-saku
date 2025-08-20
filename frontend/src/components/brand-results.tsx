import type { BrandSearchResult } from '@/ai/flows/generate-audit-report';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface BrandResultsProps {
  data: BrandSearchResult;
}

export function BrandResults({ data }: BrandResultsProps) {
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Brand Name Results</CardTitle>
        <CardDescription>
          Analysis based on the provided brand name.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <span className="font-semibold">Registration Status:</span>
          {data.isRegistered ? (
            <Badge variant="destructive" className="gap-1">
              <XCircle className="h-4 w-4" />
              Potentially Registered
            </Badge>
          ) : (
            <Badge className="bg-green-600 hover:bg-green-700 gap-1 text-primary-foreground">
              <CheckCircle2 className="h-4 w-4" />
              Likely Unregistered
            </Badge>
          )}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Owner</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.matchedMarks.length > 0 ? (
              data.matchedMarks.map((mark, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Link href={`brands/${mark.link?.split("/")[2]}`}>
                      <Image
                        src={mark.logoUrl || 'https://placehold.co/40x40.png'}
                        alt={mark.name}
                        width={40}
                        height={40}
                        className="rounded-sm"
                        data-ai-hint="logo"
                      />
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`brands/${mark.link?.split("/")[2]}`}>
                      {mark.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`brands/${mark.link?.split("/")[2]}`}>
                      {mark.status}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`brands/${mark.link?.split("/")[2]}`}>{mark.owner}</Link></TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">No similar marks found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
