"use client";

import { NotificationSchema, NotificationsService } from "@/services/admin";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AlertButton } from "@/components/ui/alert-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

import { notificationSchema } from "@/lib/schemas";
import { randomId } from "@/lib/utils";
import { z } from "@/lib/zod";

import { TemplateEmail } from "./_components/template-email";
import { TemplatesWhatsapp } from "./_components/template-whatsapp";

const NotificationForm = ({ params }: { params: { id: string } }) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: notification, isLoading } = useQuery({
    queryKey: ["notification", params.id],
    queryFn: () => NotificationsService.getNotification({ id: params.id }),
    enabled: !!params.id,
  });
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

  useEffect(() => {
    if (notification) {
      form.reset({
        id: notification.id,
        name: notification.name,
        metadata: notification.metadata,
        is_active: notification.is_active ?? false,
        is_active_email: notification.is_active_email ?? false,
        is_active_whatsapp: notification.is_active_whatsapp ?? false,

        allowed_templates_email:
          notification.allowed_templates_email?.map((template) => ({
            template_name_email: template.template_name_email ?? "",
            template_data_email: template.template_data_email ?? "",
          })) ?? [],
        allowed_templates_whatsapp:
          notification.allowed_templates_whatsapp?.map((template) => ({
            template_name_whatsapp: template.template_name_whatsapp ?? "",
          })) ?? [],
      });
    }
  }, [notification, form]);

  const update = useMutation({
    mutationFn: NotificationsService.updateNotification,
    onSuccess: async (data) => {
      toast.success("Notificação atualizada com sucesso", { position: "top-center" });
      await queryClient.setQueryData(["admin-notifications"], (curr: NotificationSchema[]) => {
        if (!curr) return;
        return curr.map((variable) => (variable.id == data.id ? data : variable));
      });
      await queryClient.setQueryData(["admin-notifications", data.id], data);
      form.reset({
        id: data.id,
        name: data.name,
        metadata: data.metadata,
        is_active: data.is_active ?? false,
        is_active_email: data.is_active_email ?? false,
        is_active_whatsapp: data.is_active_whatsapp ?? false,
        allowed_templates_email:
          data.allowed_templates_email?.map((template) => ({
            template_name_email: template.template_name_email ?? "",
            template_data_email: template.template_data_email ?? "",
          })) ?? [],
        allowed_templates_whatsapp:
          data.allowed_templates_whatsapp?.map((template) => ({
            template_name_whatsapp: template.template_name_whatsapp ?? "",
          })) ?? [],
      });
    },
  });

  const remove = useMutation({
    mutationFn: NotificationsService.deleteNotification,
    onSuccess: async () => {
      await queryClient.setQueryData(["admin-notifications"], (curr: NotificationSchema[]) => {
        if (!curr) return;
        return curr.filter((variable) => variable.id != params.id);
      });
      await queryClient.setQueryData(["admin-notifications", params.id], undefined);
      router.push("/admin/notifications");
    },
  });
  const onSubmit = (requestBody: z.infer<typeof notificationSchema>) => {
    update.mutate({
      id: params.id,
      requestBody: {
        ...requestBody,
        allowed_templates_email: requestBody.allowed_templates_email.map((template) => ({
          ...template,
          template_name_email: template.template_name_email ?? "",
          template_data_email: template.template_data_email ?? "",
        })),
        allowed_templates_whatsapp: requestBody.allowed_templates_whatsapp.map((template) => ({
          ...template,
          template_name_whatsapp: template.template_name_whatsapp ?? "",
        })),
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-full flex-col overflow-hidden p-2 md:p-4 lg:p-6">
        <Card className="flex h-full flex-col">
          <CardHeader className="pt-2">
            <CardTitle className="flex justify-between">
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-10 w-20" />
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-grow flex-col gap-2 pt-2">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </CardContent>
          <CardFooter className="mt-auto flex items-center gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="ml-auto h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!notification) return null;

  return (
    <>
      <Form {...form}>
        <form
          id="channel-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex h-full flex-col overflow-hidden"
        >
          <Card className="flex h-full flex-col">
            <CardHeader className="pt-2"></CardHeader>

            <CardContent className="flex flex-grow flex-col gap-2 overflow-y-auto">
              <div className="grid gap-2 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input className="w-1/2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-start gap-2 space-y-0 md:justify-end">
                      <FormLabel>Ativo</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {/* <KeepAlive channel={channel} /> */}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Templates Email</CardTitle>
                    <CardDescription>Selecione os templates disponíveis para uso</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TemplateEmail />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex flex-col gap-2">
                      <CardTitle>Templates WhatsApp</CardTitle>
                      <CardDescription>Selecione os templates disponíveis para uso</CardDescription>
                      <div className="flex flex-col gap-2">
                        <FormField
                          control={form.control}
                          name="metadata.dialog_api_key"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Chave API</FormLabel>
                              <FormControl>
                                <Input className="w-1/3" type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <TemplatesWhatsapp notification={notification} />
                  </CardContent>
                </Card>
              </div>
            </CardContent>

            <CardFooter className="mt-auto flex items-center gap-2">
              <Button variant="secondary" asChild>
                <Link href="/admin/notifications">
                  <ArrowLeftIcon className="mr-1 size-3.5" /> Voltar
                </Link>
              </Button>
              <AlertButton
                type="button"
                className="ml-auto"
                title="Apagar canal"
                description="Tem certeza que deseja apagar este canal?"
                variant="destructive"
                onConfirm={() => remove.mutate({ id: params.id })}
                disabled={update.isPending}
                isLoading={remove.isPending}
              >
                Apagar
              </AlertButton>
              <Button
                form="channel-form"
                className="w-24"
                isLoading={update.isPending}
                disabled={!form.formState.isDirty || remove.isPending}
              >
                Salvar
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </>
  );
};

export default NotificationForm;
