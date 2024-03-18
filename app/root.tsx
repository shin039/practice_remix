// https://remix.run/docs/en/main/start/tutorial#adding-search-spinner
// https://speakerdeck.com/takagimeow/yasasikuhazimeruremixtoweb?slide=46
// https://note.com/lada496/n/n7fb44b901364
//
// build実行について
//   https://remix.run/docs/en/main/discussion/introduction
//   https://qiita.com/RuruCun/items/2d48e58864a923555df2
//   https://zenn.dev/chimame/scraps/563e81420738c2
//
// bundler    -> esbuild
//   https://zenn.dev/ryoka419319/articles/d0a474a81efdbb
//   https://esbuild.github.io/getting-started/#build-scripts
// transpiler -> babel
//
// .envについて
//   dev -> dotenvが使える。
//   prd -> flyioの場合は、flyctl sectrets コマンドで定義する。
//          https://fly.io/docs/reference/secrets/
// 認証について
//   remix-authが良さげ。
//   -> ユーザ認証情報はkintoneで扱う？？
//      -> kintoneはIPアドレス制御ができる。
//      -> flyioは、「fly ips list -a <アプリケーション名>」でIPアドレスは分かる。
//
// flyio: https://fly.io/docs/js/the-basics/

import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  Links,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";

import type {
  LinksFunction,
  LoaderFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";
import appStylesHref from "./app.css";

import { getContacts, createEmptyContact } from "./data";

import { useEffect } from "react";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
];

// NOTE: root route で読み込まれる
//       -> server side で実行される (プライベートキー問題が発生しない, cors気にしなくていい, 非同期await使える)
export const loader = async ({request,}: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q   = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return json({ contacts, q });
}

// NOTE: action
//   -> form が submitされると呼ばれる。
//   -> GET以外のリクエストの時に呼び出される。
//   -> server side で実行され、loaderより先に呼び出される。
export const action = async () => {
  const contact = await createEmptyContact();
  return redirect(`/contacts/${contact.id}/edit`);
};

export default function App() {
  // NOTE: ↑のloaderで定義されている結果を取得する。
  const { contacts, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const searching = 
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("q");

  useEffect(() => {
    const searchField = document.getElementById("q");
    if (searchField instanceof HTMLInputElement) {
      searchField.value = q || "";
    }
  }, [q]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {/* Side bar */}
        <div id="sidebar">
          <h1>Remix Contacts</h1>
          <div>
            <Form
              id="search-form"
              onChange={event => {
                const isFirstSearch = q === null;
                submit(event.currentTarget, {replace: !isFirstSearch})
              }}
              role="search"
            >
              <input
                id="q"
                aria-label="Search contacts"
                className={searching ? "loading" : ""}
                defaultValue={q || ""}
                placeholder="Search"
                type="search"
                name="q"
              />
              <div id="search-spinner" hidden={!searching} aria-hidden hidden={true} />
            </Form>
            <Form method="post">
              {/* submit -> actionを呼び出す。 */}
              <button type="submit">New</button>
            </Form>
          </div>
          <nav>
            {contacts.length ? (
              <ul>
                {contacts.map((contact) => (
                  <li key={contact.id}>
                    <NavLink
                      className={({ isActive, isPending }) =>
                        isActive
                          ? "active"
                          : isPending
                          ? "pending"
                          : ""
                      }
                      to={`contacts/${contact.id}`}
                    >
                      {contact.first || contact.last ? (
                        <>
                          {contact.first} {contact.last}
                        </>
                      ) : (
                        <i>No Name</i>
                      )}{" "}
                      {contact.favorite ? (
                        <span>★</span>
                      ) : null}
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : ( <p> <i>No contacts</i> </p>)}
          </nav>
        </div>

        {/* Main */}
        <div
          className={navigation.state === "loading" && !searching
            ? "loading"
            : ""
          }
          id="detail"
        >
          {/* NOTE: 子ルートの要素をレンダリングしている */}
          <Outlet />
        </div>

        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
