
import { isAuthorized } from "@/lib/isAuthorized";
import NavbarClient from "./NavbarClient";

const Navbar = async () => {
  const user = await isAuthorized();

  return <NavbarClient user={!!user} />;
};

export default Navbar;
