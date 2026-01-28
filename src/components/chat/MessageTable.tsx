import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MessageTableProps {
  data: {
    headers: string[];
    rows: string[][];
  };
}

export const MessageTable = ({ data }: MessageTableProps) => {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/50 hover:bg-secondary/50">
            {data.headers.map((header, index) => (
              <TableHead key={index} className="font-medium text-foreground text-xs">
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.rows.map((row, rowIndex) => (
            <TableRow key={rowIndex} className="hover:bg-secondary/30">
              {row.map((cell, cellIndex) => (
                <TableCell key={cellIndex} className="text-sm">
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
