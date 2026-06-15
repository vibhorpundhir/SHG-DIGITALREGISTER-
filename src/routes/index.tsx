import { createFileRoute } from "@tanstack/react-router";
import { Homepage } from "@/components/Homepage";

import loginCss from "../components/login.css?url";
import homepageCss from "../components/homepage.css?url";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SPECTRA — SHG Digital Register | होमपेज" },
      {
        name: "description",
        content:
          "SPECTRA SHG Digital Register — manage Self Help Groups, members, savings and reports digitally.",
      },
    ],
    links: [
      { rel: "stylesheet", href: loginCss },
      { rel: "stylesheet", href: homepageCss },
    ],
  }),
  component: () => <Homepage />,
});
