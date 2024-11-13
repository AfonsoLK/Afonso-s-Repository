import { useModal } from "@/hooks/use-modal";
import { NotificationSchema, NotificationsService } from "@/services/admin";
import { useQuery } from "@tanstack/react-query";
import { RowSelectionState } from "@tanstack/react-table";
import { useMemo } from "react";
import { useFormContext } from "react-hook-form";

import { DataTable } from "@/components/ui/data-table";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

import { notificationSchema } from "@/lib/schemas";
import { z } from "@/lib/zod";

import { STATUS, columns } from "../column";

const TemplatesWhatsapp = ({ notification }: { notification: NotificationSchema }) => {
  const openModal = useModal((s) => s.openModal);
  const form = useFormContext<z.infer<typeof notificationSchema>>();

  const { data: templates, isLoading } = useQuery({
    queryKey: ["templates", notification.id],
    queryFn: () => NotificationsService.getTemplatesWhatsappByNotification({ id: notification.id }),
  });

  const allowedTemplates = form.watch("allowed_templates_whatsapp");
  const rowSelection = useMemo(() => {
    if (!allowedTemplates || !templates) {
      return {};
    }
    return allowedTemplates.reduce((acc: RowSelectionState, template) => {
      const templateIndex = templates.findIndex((t) => t.name === template.template_name_whatsapp);
      if (templateIndex !== -1) {
        acc[templateIndex] = true;
      }
      return acc;
    }, {});
  }, [allowedTemplates, templates]);

  return (
    <DataTable
      searchColumn="name"
      columns={columns}
      data={templates}
      isLoading={isLoading}
      multiSelect
      rowSelection={rowSelection}
      onRowSelectionChange={(updater) => {
        if (!templates) return;
        const selectedTemplates = templates.filter((_, index) => updater[index]);
        form.setValue(
          "allowed_templates_whatsapp",
          selectedTemplates.map((t) => ({
            template_name_whatsapp: t.name,
          })),
          { shouldDirty: true },
        );
      }}
      filters={[
        {
          column: "status",
          title: "Status",
          options: STATUS,
        },
        {
          column: "select",
          title: "Aprovados",
          options: [
            { value: "true", label: "Sim" },
            { value: "false", label: "Não" },
          ],
        },
      ]}
      onRowClick={(template) => {
        openModal("template", template);
      }}
      rightSection={
        <div className="flex flex-row gap-2 md:flex-row md:items-center">
          <FormField
            control={form.control}
            name="is_active_whatsapp"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 md:flex-row md:space-y-0">
                <FormLabel className="flex items-center gap-2">Ativo</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      }
    />
  );
};

export { TemplatesWhatsapp };
