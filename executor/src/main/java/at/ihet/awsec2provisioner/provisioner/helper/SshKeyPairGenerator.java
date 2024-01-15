package at.ihet.awsec2provisioner.provisioner.helper;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.nio.file.Files;
import java.nio.file.Path;

import static java.lang.System.out;

@ApplicationScoped
public class SshKeyPairGenerator {

    @Inject
    Configuration configuration;

    public void generateKeyPairs(boolean regenerate, int keySize) {
        out.println("Generating ssh-key pairs...");
        for (int i = 0; i < configuration.instanceCount; i++) {
            var privateKeyFilePath = Path.of("%s/id_rsa_%s".formatted(configuration.outDir, i));
            if (!Files.exists(privateKeyFilePath) | regenerate) {
                generateKeyPair(privateKeyFilePath, keySize);
            } else {
                out.println("Skipped ssh-key pair generation because already present '" + privateKeyFilePath + "'");
            }
        }
    }

    private void generateKeyPair(Path privateKeyFilePath, int keySize) {
        out.println("Generating ssh-key pair '" + privateKeyFilePath + "'...");
        CommandExecutor.execute("ssh-keygen -t rsa -b %s -f \"%s\" -q -N ''".formatted(keySize, privateKeyFilePath.toString()));
    }
}
