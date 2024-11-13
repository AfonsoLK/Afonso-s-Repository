import { useModal } from "@/hooks/use-modal";
import { NotificationsService } from "@/services/admin";
import { useQuery } from "@tanstack/react-query";
import { RowSelectionState } from "@tanstack/react-table";
import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

import { DataTable } from "@/components/ui/data-table";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

import { notificationSchema } from "@/lib/schemas";

import { columns } from "./columns";

const TemplateEmail = () => {
  const { data: models, isLoading } = useQuery({
    queryKey: ["admin-notifications-templates-email"],
    queryFn: () => NotificationsService.listTemplates(),
  });

  const form = useFormContext<z.infer<typeof notificationSchema>>();
  const openModal = useModal((s) => s.openModal);

  const allowedTemplates = form.watch("allowed_templates_email");
  const rowSelection = useMemo(() => {
    if (!allowedTemplates || !models) {
      return {};
    }

    return allowedTemplates.reduce((acc: RowSelectionState, template) => {
      const templateIndex = models.findIndex((t) => t.template_name_email === template.template_name_email);
      if (templateIndex !== -1) {
        acc[templateIndex] = true;
      }
      return acc;
    }, {});
  }, [allowedTemplates, models]);

  return (
    <DataTable
      columns={columns}
      data={models}
      isLoading={isLoading}
      multiSelect
      rowSelection={rowSelection}
      onRowSelectionChange={(updater) => {
        if (!models) return;
        const selectedTemplates = models.filter((_, index) => updater[index]);
        form.setValue(
          "allowed_templates_email",
          selectedTemplates.map((t) => ({
            template_name_email: t.template_name_email ?? "",
            template_data_email: t.template_data_email ?? "",
            is_active_email: false,
          })),
          { shouldDirty: true },
        );
      }}
      searchColumn="template_name_email"
      noResultsMessage="Nenhum template encontrado"
      onRowClick={(template) => {
        openModal("email-template", template);
      }}
      rightSection={
        <FormField
          control={form.control}
          name="is_active_email"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2 space-y-0">
              <FormLabel className="flex items-center gap-2">Ativo</FormLabel>
              <FormControl>
                <Switch checked={!!field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
      }
    />
  );
};

export { TemplateEmail };
