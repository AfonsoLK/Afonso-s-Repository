import { TemplateSchema } from "@/services";
import { ColumnDef } from "@tanstack/react-table";

import { Badge, BadgeProps } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table";
import { HelpTooltip } from "@/components/ui/help-tooltip";

export const STATUS: { value: TemplateSchema["status"]; label: string; variant?: BadgeProps["variant"] }[] = [
  { value: "approved", label: "Aprovado", variant: true },
  { value: "disabled", label: "Desativado", variant: "destructive" },
  { value: "pending", label: "Pendente", variant: "warning" },
  { value: "rejected", label: "Rejeitado", variant: "destructive" },
];

export const columns: ColumnDef<TemplateSchema>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <HelpTooltip side="bottom" align="start">
        Selecione os templates disponíveis para uso
      </HelpTooltip>
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        onClick={(e) => e.stopPropagation()}
        aria-label="Selecionar template"
      />
    ),

    filterFn: (row, id, value) => {
      if (!value) return true;
      return value == "true" ? row.getIsSelected() : !row.getIsSelected();
    },
    enableSorting: false,
    enableHiding: false,
    size: 30,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader className="justify-center" column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = STATUS.find((s) => s.value === row.original.status);
      return (
        <div className="flex justify-center">
          <Badge variant={status?.variant}>{status?.label}</Badge>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nome" />,
    size: 1000,
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader className="justify-center" column={column} title="Categoria" />
    ),
    cell: ({ row }) => {
      return <div className="text-center">{row.original.category}</div>;
    },
  },
];
