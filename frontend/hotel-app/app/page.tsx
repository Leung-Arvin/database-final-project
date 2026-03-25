import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

export default function Home() {
  return (
    <NavigationMenu>
    <NavigationMenuList>
    <NavigationMenuLink>
        Home   
        </NavigationMenuLink>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
