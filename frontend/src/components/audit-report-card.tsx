import type { GenerateAuditReportOutput } from '@/ai/flows/generate-audit-report';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Lightbulb } from 'lucide-react';

interface AuditReportCardProps {
  data: GenerateAuditReportOutput;
}

function getProgressColor(value: number): string {
    if (value > 70) return 'bg-destructive';
    if (value > 40) return 'bg-yellow-500';
    return 'bg-green-500';
}

function getEligibilityColor(value: number): string {
    if (value < 40) return 'bg-destructive';
    if (value < 70) return 'bg-yellow-500';
    return 'bg-green-500';
}


export function AuditReportCard({ data }: AuditReportCardProps) {
  return (
    <Card className="animate-fade-in border-primary/50 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Comprehensive Audit Report</CardTitle>
        <CardDescription>
          Generated on {new Date(data.timestamp).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
            <div className="flex justify-between font-semibold">
                <span>Duplicate Risk Score</span>
                <span style={{ color: `hsl(var(--${getProgressColor(data.duplicateRiskScore).replace('bg-', '')}))` }}>
                    {data.duplicateRiskScore}%
                </span>
            </div>
            <Progress value={data.duplicateRiskScore} indicatorClassName={getProgressColor(data.duplicateRiskScore)} aria-label={`Duplicate risk score: ${data.duplicateRiskScore}%`} />
            <p className="text-xs text-muted-foreground">Higher score indicates a greater risk of conflict.</p>
        </div>

        <div className="space-y-2">
            <div className="flex justify-between font-semibold">
                <span>PDKI Eligibility Estimation</span>
                <span style={{ color: `hsl(var(--${getEligibilityColor(data.pdkiEligibilityPercent).replace('bg-', '')}))` }}>
                    {data.pdkiEligibilityPercent}%
                </span>
            </div>
            <Progress value={data.pdkiEligibilityPercent} indicatorClassName={getEligibilityColor(data.pdkiEligibilityPercent)} aria-label={`Eligibility estimation: ${data.pdkiEligibilityPercent}%`} />
            <p className="text-xs text-muted-foreground">Estimated chance of successful registration.</p>
        </div>

        <div className="rounded-lg bg-muted p-4">
            <div className="flex items-start gap-3">
                <Lightbulb className="h-6 w-6 shrink-0 text-primary" />
                <div>
                    <h4 className="font-semibold">Notes & Recommendations</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{data.notes}</p>
                </div>
            </div>
        </div>

      </CardContent>
    </Card>
  );
}
