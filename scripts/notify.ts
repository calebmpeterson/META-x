import { showNotification } from "../src/utils/showNotification";

const [message = "test notification", title, subtitle] = process.argv.slice(2);
showNotification({ message, title, subtitle });
