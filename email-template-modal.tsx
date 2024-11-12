"use client";

import { useModal } from "@/hooks/use-modal";
import { TemplateEmailSchema } from "@/services/admin";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const EmailTemplateModal = () => {
  const { isOpen, data, onOpenChange, modalName } = useModal<TemplateEmailSchema>();

  const formatTemplate = (template: string) => {
    return template;
  };

  return (
    <Dialog open={isOpen && modalName === "email-template"} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] w-[95vw] max-w-[600px] sm:w-auto">
        <DialogHeader>
          <DialogTitle>{data?.template_name_email || "Template"}</DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto bg-white p-8">
          {data?.template_data_email ? (
            <div
              className="w-full rounded-lg bg-white"
              dangerouslySetInnerHTML={{
                __html: formatTemplate(data.template_data_email),
              }}
            />
          ) : (
            <p className="text-muted-foreground">Nenhum conteúdo disponível</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { EmailTemplateModal };
