"use client";

import { ConnectButton } from "360dialog-connect-button";
import { useModal } from "@/hooks/use-modal";
import { NotificationSchema, NotificationsService } from "@/services/admin";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { notificationSchema } from "@/lib/schemas";
import { randomId } from "@/lib/utils";
import { z } from "@/lib/zod";

import { Button, buttonVariants } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";

export const NotificationModal = () => {
  const { data, onOpenChange } = useModal<NotificationSchema>();

  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof notificationSchema>>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      id: randomId(),
      name: "",
      metadata: {},
      is_active: false,
      is_active_email: false,
      is_active_whatsapp: false,
      allowed_templates_email: [
        {
          template_name_email: "",
          template_data_email: "",
        },
      ],
      allowed_templates_whatsapp: [
        {
          template_name_whatsapp: "",
        },
      ],
    },
  });

  const create = useMutation({
    mutationFn: NotificationsService.createNotification,
    onSuccess: async (data) => {
      onOpenChange(false);
      await queryClient.setQueryData(["admin-notifications"], (old: NotificationSchema[] | undefined) => {
        if (!old) return [data];
        return [...old, data];
      });
    },
  });

  const update = useMutation({
    mutationFn: NotificationsService.updateNotification,
    onSuccess: async (data) => {
      await queryClient.setQueryData(["admin-notifications"], (curr: NotificationSchema[]) => {
        return curr.map((variable) => (variable.id == data.id ? data : variable));
      });
      onOpenChange(false);
    },
  });

  const onSubmit = (requestBody: z.infer<typeof notificationSchema>) => {
    const formattedBody = {
      ...requestBody,
    };

    if (data?.id) {
      update.mutate({
        id: data.id,
        requestBody: {
          ...formattedBody,
          allowed_templates_email: formattedBody.allowed_templates_email.map((template) => ({
            ...template,
            template_name_email: template.template_name_email || null,
            template_data_email: template.template_data_email || null,
          })),
          allowed_templates_whatsapp: formattedBody.allowed_templates_whatsapp.map((template) => ({
            ...template,
            template_name_whatsapp: template.template_name_whatsapp || null,
          })),
        },
      });
      return;
    }
    create.mutate({
      requestBody: {
        ...formattedBody,
        allowed_templates_email: formattedBody.allowed_templates_email.map((template) => ({
          ...template,
          template_name_email: template.template_name_email || null,
          template_data_email: template.template_data_email || null,
        })),
        allowed_templates_whatsapp: formattedBody.allowed_templates_whatsapp.map((template) => ({
          ...template,
          template_name_whatsapp: template.template_name_whatsapp || null,
        })),
      },
    });
  };

  return (
    <>
      <Dialog open onOpenChange={onOpenChange}>
        <DialogContent aria-describedby="">
          <DialogHeader>
            <DialogTitle>{data ? "Editar notificação" : "Nova notificação"}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2 pt-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="metadata.dialog_api_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chave API</FormLabel>
                    <FormControl>
                      <Input placeholder="Chave API" {...field} value={field.value?.toString() ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!data?.id && (
                <ConnectButton
                  type="button"
                  partnerId={"g1RiE4PA"}
                  callback={(callbackObject) => {}}
                  className={buttonVariants({ variant: "secondary" })}
                  label="Vincular conta 360Dialog"
                />
              )}

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormLabel>Ativo</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button isLoading={create.isPending || update.isPending} className="mt-4">
                Salvar
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};
