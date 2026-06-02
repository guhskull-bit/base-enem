import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export function RankingTable({
  rows,
  currentUserId,
}: {
  rows: Array<{
    id: string;
    name: string;
    className: string;
    percent: number;
    totalQuestions: number;
  }>;
  currentUserId?: string | null;
}) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Posição</TableHead>
              <TableHead>Aluno</TableHead>
              <TableHead>Turma</TableHead>
              <TableHead>Acerto</TableHead>
              <TableHead>Questões</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow
                key={row.id}
                className={cn(currentUserId === row.id && "bg-base-50", index < 3 && "bg-gold-50/70")}
              >
                <TableCell className="font-semibold">
                  {index + 1}
                  {index < 3 ? <Badge className="ml-2 bg-gold-500 text-white">Top {index + 1}</Badge> : null}
                </TableCell>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.className}</TableCell>
                <TableCell>{Math.round(row.percent)}%</TableCell>
                <TableCell>{row.totalQuestions}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
