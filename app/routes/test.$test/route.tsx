import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";

import { useLoaderData, } from "@remix-run/react";


export const loader = async ({ params, }: LoaderFunctionArgs) => {
// DEBUG
console.log(`### params => ${JSON.stringify(params)}`);
  const {test} = params;
  return json({ test });
};

export default function Test() {
  const { test } = useLoaderData<typeof loader>();
  return <div id="contact">test id = {test}</div>
};
