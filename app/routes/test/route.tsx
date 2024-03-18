import { Outlet } from "@remix-run/react";

export default function Test() {
  return (
    <>
      <p id="test-index-page"> This is a Test  for Remix. </p>
      <Outlet />
    </>
  );
}
