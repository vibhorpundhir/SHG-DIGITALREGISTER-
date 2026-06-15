import { createFileRoute } from "@tanstack/react-router";
import { SHGRegister } from "@/components/SHGRegister";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "SHG बचत रजिस्टर" },
      { name: "description", content: "Digital SHG savings register with auto calculation, Excel and PDF export." },
    ],
  }),
  component: () => <SHGRegister />,
});
