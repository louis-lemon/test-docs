'use client';

import { Header, HomeLayout, HomeLayoutProps } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import { Fragment, HTMLAttributes, useMemo } from "react";
import { NavProvider } from "fumadocs-ui/contexts/layout";
import { cn } from "fumadocs-ui/utils/cn";
import { getLinks, LinkItemType } from "fumadocs-ui/layouts/links";
import {
    Navbar, NavbarLink,
    NavbarMenu,
    NavbarMenuContent,
    NavbarMenuLink,
    NavbarMenuTrigger
} from "fumadocs-ui/layouts/home/navbar";
import Link from "next/link";
import { LargeSearchToggle, SearchToggle } from "fumadocs-ui/components/layout/search-toggle";
import { ThemeToggle } from "fumadocs-ui/components/layout/theme-toggle";
import { LanguageToggle, LanguageToggleText } from "fumadocs-ui/components/layout/language-toggle";
import { ChevronDown, Languages } from "fumadocs-ui/internal/icons";
import { Menu, MenuContent, MenuLinkItem, MenuTrigger } from "fumadocs-ui/layouts/home/menu";
import { buttonVariants } from "fumadocs-ui/components/ui/button";

export function LemonHomeLayout(
    props: HomeLayoutProps & HTMLAttributes<HTMLElement>,
) {
    const {
        nav = {},
        links,
        githubUrl,
        i18n,
        disableThemeSwitch = false,
        themeSwitch = { enabled: !disableThemeSwitch },
        searchToggle,
        ...rest
    } = props;

    return (
        <NavProvider transparentMode={nav?.transparentMode}>
            <main
                id="nd-home-layout"
                {...rest}
                className={cn('flex flex-1 flex-col pt-16 sm:pt-24', rest.className)}
            >
                {nav.enabled !== false &&
                    (nav.component ?? (
                        <LemonHomeHeader
                            links={links}
                            nav={nav}
                            themeSwitch={themeSwitch}
                            searchToggle={searchToggle}
                            i18n={i18n}
                            githubUrl={githubUrl}
                        />
                    ))}
                {props.children}
            </main>
        </NavProvider>
    );
}

function LemonHomeHeader({
    nav = {},
    i18n = false,
    links,
    githubUrl,
    themeSwitch = {},
    searchToggle = {},
}: HomeLayoutProps) {
    const finalLinks = useMemo(
        () => getLinks(links, githubUrl),
        [links, githubUrl],
    );

    const navItems = finalLinks.filter((item) =>
        ['nav', 'all'].includes(item.on ?? 'all'),
    );
    const menuItems = finalLinks.filter((item) =>
        ['menu', 'all'].includes(item.on ?? 'all'),
    );

    return (
        <>
        <Navbar className="!flex-wrap !h-auto !items-start !border-none">
            <Link
                href={nav.url ?? '/'}
                className="inline-flex items-center gap-2.5 font-semibold py-3"
            >
                {nav.title}
            </Link>
            {nav.children}
            <div className="flex-1 flex justify-center max-lg:hidden py-3">
                {searchToggle.enabled !== false &&
                    (searchToggle.components?.lg ?? (
                        <LargeSearchToggle
                            className="w-full rounded-full ps-2.5 max-w-[350px] cursor-pointer"
                            hideIfDisabled
                        />
                    ))}
            </div>
            <div className="flex flex-row items-center gap-1.5 max-lg:hidden py-3">
                {themeSwitch.enabled !== false &&
                    (themeSwitch.component ?? <ThemeToggle mode={themeSwitch?.mode} />)}
                {i18n ? (
                    <LanguageToggle>
                        <Languages className="size-5" />
                    </LanguageToggle>
                ) : null}
                <div className="flex flex-row items-center empty:hidden">
                    {navItems.filter(isSecondary).map((item, i) => (
                        <LemonNavbarLinkItem key={i} item={item} />
                    ))}
                </div>
            </div>
            <ul className="flex flex-row items-center ms-auto -me-1.5 lg:hidden">
                {searchToggle.enabled !== false &&
                    (searchToggle.components?.sm ?? (
                        <SearchToggle className="p-2 cursor-pointer" hideIfDisabled />
                    ))}
                <Menu>
                    <MenuTrigger
                        aria-label="Toggle Menu"
                        className={cn(
                            buttonVariants({
                                size: 'icon',
                                color: 'ghost',
                                className: 'group',
                            }),
                        )}
                        enableHover={nav.enableHoverToOpen}
                    >
                        <ChevronDown className="!size-5.5 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                    </MenuTrigger>
                    <MenuContent className="sm:flex-row sm:items-center sm:justify-end">
                        {menuItems
                            .filter((item) => !isSecondary(item))
                            .map((item, i) => (
                                <MenuLinkItem key={i} item={item} className="sm:hidden" />
                            ))}
                        <div className="-ms-1.5 flex flex-row items-center gap-1.5 max-sm:mt-2">
                            {menuItems.filter(isSecondary).map((item, i) => (
                                <MenuLinkItem key={i} item={item} className="-me-1.5" />
                            ))}
                            <div role="separator" className="flex-1" />
                            {i18n ? (
                                <LanguageToggle>
                                    <Languages className="size-5" />
                                    <LanguageToggleText />
                                    <ChevronDown className="size-3 text-fd-muted-foreground" />
                                </LanguageToggle>
                            ) : null}
                            {themeSwitch.enabled !== false &&
                                (themeSwitch.component ?? (
                                    <ThemeToggle mode={themeSwitch?.mode} />
                                ))}
                        </div>
                    </MenuContent>
                </Menu>
            </ul>
        </Navbar>
        <Navbar id="second-nav" className="!h-10 max-sm:hidden !top-[calc(var(--fd-banner-height)+3.5rem)] [&_nav]:!h-10 !border-t-0 backdrop-blur-sm">
            <ul className="flex flex-row items-center gap-2">
                {navItems
                    .filter((item) => !isSecondary(item))
                    .map((item, i) => (
                        <LemonNavbarLinkItem key={i} item={item} className="text-sm" />
                    ))}
            </ul>
        </Navbar>
        </>
    );
}

function LemonNavbarLinkItem({
    item,
    ...props
}: {
    item: LinkItemType;
    className?: string;
}) {
    if (item.type === 'custom') return <div {...props}>{item.children}</div>;

    if (item.type === 'menu') {
        const children = item.items.map((child, j) => {
            if (child.type === 'custom')
                return <Fragment key={j}>{child.children}</Fragment>;

            const {
                banner = child.icon ? (
                    <div className="w-fit rounded-md border bg-fd-muted p-1 [&_svg]:size-4">
                        {child.icon}
                    </div>
                ) : null,
                ...rest
            } = child.menu ?? {};

            return (
                <NavbarMenuLink
                    key={j}
                    href={child.url}
                    external={child.external}
                    {...rest}
                >
                    {rest.children ?? (
                        <>
                            {banner}
                            <p className="text-[15px] font-medium">{child.text}</p>
                            <p className="text-sm text-fd-muted-foreground empty:hidden">
                                {child.description}
                            </p>
                        </>
                    )}
                </NavbarMenuLink>
            );
        });

        return (
            <NavbarMenu>
                <NavbarMenuTrigger {...props}>
                    {item.url ? (
                        ('external' in item && item.external) ? (
                            <a href={item.url} target="_blank" rel="noopener noreferrer">
                                {item.text}
                            </a>
                        ) : (
                            <Link href={item.url}>
                                {item.text}
                            </Link>
                        )
                    ) : (
                        item.text
                    )}
                </NavbarMenuTrigger>
                <NavbarMenuContent>{children}</NavbarMenuContent>
            </NavbarMenu>
        );
    }

    return (
        <NavbarLink
            {...props}
            item={item}
            variant={item.type}
            aria-label={item.type === 'icon' ? item.label : undefined}
        >
            {item.type === 'icon' ? item.icon : item.text}
        </NavbarLink>
    );
}

function isSecondary(item: LinkItemType): boolean {
    if ('secondary' in item && item.secondary != null) return item.secondary;
    return item.type === 'icon';
}