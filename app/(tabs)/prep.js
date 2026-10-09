// Hidden route kept for older links: the English prep hub now lives in the Exam tab.
import { Redirect } from "expo-router";
export default function PrepRedirect() { return <Redirect href={{ pathname: "/nclex", params: { section: "english" } }} />; }
