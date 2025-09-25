import React from "react";
import { FooterLinks } from "./footer.types";
import Link from "next/link";
import { cn } from "@/lib/utils";

const footerLinksData: FooterLinks[] = [
  {
    id: 1,
    title: "shop",
    children: [
      {
        id: 11,
        label: "all products",
        url: "/shop",
      },
      {
        id: 12,
        label: "new arrivals",
        url: "/shop#new-arrivals",
      },
      {
        id: 13,
        label: "top selling",
        url: "/shop#top-selling",
      },
      {
        id: 14,
        label: "on sale",
        url: "/shop#on-sale",
      },
    ],
  },
  {
    id: 2,
    title: "account",
    children: [
      {
        id: 21,
        label: "profile",
        url: "/profile",
      },
      {
        id: 22,
        label: "order tracking",
        url: "/order-tracking",
      },
      {
        id: 23,
        label: "sign up",
        url: "/signup",
      },
      {
        id: 24,
        label: "log in",
        url: "/login",
      },
    ],
  },
  {
    id: 3,
    title: "support",
    children: [
      {
        id: 31,
        label: "shipping guide",
        url: "/order-tracking",
      },
      {
        id: 32,
        label: "returns & exchanges",
        url: "mailto:support@tsrfashion.com",
      },
      {
        id: 33,
        label: "contact support",
        url: "mailto:support@tsrfashion.com",
      },
      {
        id: 34,
        label: "faqs",
        url: "/order-tracking",
      },
    ],
  },
];

const LinksSection = () => {
  return (
    <>
      {footerLinksData.map((item) => (
        <section className="flex flex-col mt-5" key={item.id}>
          <h3 className="font-medium text-sm md:text-base uppercase tracking-widest mb-6">
            {item.title}
          </h3>
          {item.children.map((link) => (
            <Link
              href={link.url}
              key={link.id}
              className={cn(
                "text-black/60 text-sm md:text-base mb-4 w-fit capitalize hover:text-black transition"
              )}
            >
              {link.label}
            </Link>
          ))}
        </section>
      ))}
    </>
  );
};

export default LinksSection;
