package at.ihet.awsec2provisioner.provisioner;

import at.ihet.awsec2provisioner.provisioner.helper.Configuration;
import jakarta.inject.Inject;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static java.lang.System.out;
import static picocli.CommandLine.Command;

@Command(name = "cleanup",
        header = "Cleans up the runtime data",
        description = "Deletes all files and directories in 'OUT_DIR' and 'cdk.out'"
)
public class CleanupCommand implements Runnable {

    @Inject
    Configuration configuration;

    @Override
    public void run() {
        out.println("Cleaning...");
        if (Files.exists(configuration.cdkOutDir)) {
            deleteRecursively(configuration.cdkOutDir);
        }
        if (Files.exists(configuration.outDir)) {
            deleteRecursively(configuration.outDir);
        }
        out.println("Cleaned...");
    }

    private void deleteRecursively(Path path) {
        var filesList = listFiles(path);
        try {
            for (var filePath : filesList) {
                if (Files.isDirectory(filePath)) {
                    deleteRecursively(filePath);
                }
                Files.deleteIfExists(filePath);
            }
        } catch (IOException e) {
            throw new RuntimeException("Deletion failed", e);
        }
    }

    private static List<Path> listFiles(Path path) {
        try (var filesStream = Files.list(path)) {
            return filesStream.toList();
        } catch (Exception e) {
            throw new RuntimeException("Could not list files", e);
        }
    }
}
