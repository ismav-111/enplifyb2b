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
    <div className="card-elevated overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            {data.headers.map((header, index) => (
              <TableHead key={index} className="font-semibold text-foreground text-[13px] tracking-wide">
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.rows.map((row, rowIndex) => (
            <TableRow key={rowIndex} className="hover:bg-muted/30 transition-colors">
              {row.map((cell, cellIndex) => (
                <TableCell key={cellIndex} className="text-[14px]">
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
