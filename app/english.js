// Older links to /english open the Exam tab on "OET & IELTS".
import { Redirect } from "expo-router";
export default function EnglishRedirect() { return <Redirect href={{ pathname: "/nclex", params: { section: "english" } }} />; }
