import type { ComponentPropsWithoutRef, ReactNode } from "react";

type PreProps = ComponentPropsWithoutRef<"pre"> & {
  children?: ReactNode;
};

function Pre({ children, ...props }: PreProps) {
  return <pre {...props}>{children}</pre>;
}

export const mdxComponents = {
  pre: Pre,
  img: (props: ComponentPropsWithoutRef<"img">) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt ?? ""} loading="lazy" />
  ),
};
