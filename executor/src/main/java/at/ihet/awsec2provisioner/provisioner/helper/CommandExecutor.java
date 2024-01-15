package at.ihet.awsec2provisioner.provisioner.helper;

import static java.lang.System.out;

public class CommandExecutor {
    public static void execute(String command) {
        try {
            out.println(command);
            new ProcessBuilder("sh", "-c", command)
                    .inheritIO()
                    .start()
                    .waitFor();
        } catch (Exception e) {
            throw new RuntimeException("command failed", e);
        }
    }
}
