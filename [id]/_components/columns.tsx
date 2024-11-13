import { TemplateEmailSchema } from "@/services/admin/types.gen";
import { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table";
import { HelpTooltip } from "@/components/ui/help-tooltip";

export const columns: ColumnDef<TemplateEmailSchema>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <HelpTooltip side="bottom" align="start">
        Clique para visualizar o template
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

    filterFn: (row, value) => {
      if (!value) return true;
      return value == "true" ? row.getIsSelected() : !row.getIsSelected();
    },
    enableSorting: false,
    enableHiding: false,
    size: 30,
  },

  {
    accessorKey: "template_name_email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nome" />,
    size: 1000,
  },
];
