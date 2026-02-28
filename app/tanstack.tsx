"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/sonner";

export default function Tanstack(props: { children: React.ReactNode }) {
  const client = new QueryClient();
  return (
    <>
      <QueryClientProvider client={client}>
        {props.children}
      </QueryClientProvider>
      <ReactQueryDevtools client={client} />
      <Toaster />
    </>
  );
}
