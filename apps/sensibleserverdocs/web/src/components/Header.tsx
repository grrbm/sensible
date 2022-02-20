import Head from "next/head";
import Link from "next/link";
import { useDocsQuery } from "../hooks/useDocsQuery";
import { useSiteParams } from "../hooks/useSiteParams";
import { getDocs } from "../util";
import DarkModeToggle from "./DarkModeToggle";
import FiMenuIcon from "../../public/FiMenu.svg";
import { Svg } from "react-with-native";
import useStore from "../store";

const Header = () => {
  const { urlUrl } = useSiteParams();
  const docs = useDocsQuery();
  const constants = getDocs(docs)?.constants;
  const [showMenuMobile, setShowMenuMobile] = useStore("showMenuMobile");
  const title = (
    <div className="ml-4">
      <h1 className="text-xl font-bold">
        {constants?.appName || "Sensible Docs"}
      </h1>
      <p
        onClick={() => {
          window.open("https://sensibleframework.co", "_blank")?.focus();
        }}
        className="text-sm cursor-pointer hover:underline"
      >
        {constants?.appName && "Sensible Docs"}
      </p>
    </div>
  );

  const headTitle = `${
    constants?.appName ? constants.appName + " - " : ""
  }Sensible Docs`;

  const description =
    "Sensible is the fastest way to make an app. Check it out!";

  const imageBase = urlUrl ? urlUrl : "";
  const imageUrl = imageBase + "/logo.png";

  return (
    <div className="w-full px-4 border-b border-gray-100">
      <Head>
        <title>{headTitle}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
        <meta name="referrer" content="no-referrer-when-downgrade" />
      </Head>
      <div className={"flex flex-row items-center justify-between p-3"}>
        <div className="flex">
          {/* eslint-disable-next-line */}
          <img
            width={30}
            src={imageUrl}
            alt="Logo"
            className={"hover:animate-ping"}
          />
          {title}
        </div>
        <div className="flex flex-row">
          <div className="lg:flex hidden">
            <a
              className="py-2 px-3 mr-4 hover:bg-gray-100 rounded-md font-semibold"
              href={constants ? "/" : "https://sensibleframework.co"}
              rel="noreferrer"
              target={constants ? undefined : "_blank"}
            >
              Home
            </a>

            <Link passHref href={"#"}>
              <div className="py-2 px-3 mr-4 bg-gray-100 rounded-md font-semibold cursor-pointer">
                Docs
              </div>
            </Link>

            {constants?.domain ? (
              <a
                className="py-2 px-3 mr-4 hover:bg-gray-100 rounded-md font-semibold"
                href={constants.domain}
                rel="noreferrer"
                target="_blank"
              >
                Visit website
              </a>
            ) : null}

            {constants?.email ? (
              <a
                className="py-2 px-3 mr-4 hover:bg-gray-100 rounded-md font-semibold"
                href={`mailto:${constants.email}`}
                rel="noreferrer"
                target="_blank"
              >
                Contact
              </a>
            ) : null}
          </div>

          <DarkModeToggle />

          {!!urlUrl ? (
            <div
              className="visible lg:hidden focus:bg-blueish rounded-full p-2"
              onClick={() => {
                setShowMenuMobile(!showMenuMobile);
              }}
            >
              <Svg src={FiMenuIcon} className="w-8 h-8" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Header;