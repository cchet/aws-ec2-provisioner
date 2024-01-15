package at.ihet.awsec2provisioner.provisioner;

import at.ihet.awsec2provisioner.provisioner.helper.AwsCdkExecutor;
import at.ihet.awsec2provisioner.provisioner.helper.CommandExecutor;
import at.ihet.awsec2provisioner.provisioner.helper.Configuration;
import at.ihet.awsec2provisioner.provisioner.helper.SshKeyPairGenerator;
import jakarta.inject.Inject;

import java.nio.file.Files;

import static java.lang.System.out;
import static picocli.CommandLine.Command;
import static picocli.CommandLine.Option;

@Command(name = "deploy",
        header = "Synthesizes and deploys the aws cdk infrastructure definition"
)
public class DeployCommand implements Runnable {

    @Inject
    Configuration configuration;

    @Inject
    SshKeyPairGenerator sshKeyPairGenerator;

    @Inject
    AwsCdkExecutor awsCdkExecutor;

    @Option(names = {"-r", "--regenerate-ssh-key-pairs"}, defaultValue = "false", description = "True if the ssh-key pairs need to be regenerated")
    private boolean regenerateSshKeyPairs;
    @Option(names = {"-k", "--key-size"}, defaultValue = "1024", description = "The size of the generate key-pair in bytes")
    private int keySize;

    @Override
    public void run() {
        out.println("Deploying...");
        sshKeyPairGenerator.generateKeyPairs(regenerateSshKeyPairs, keySize);
        awsCdkExecutor.deploy();
        if (Files.exists(configuration.callbackScript())) {
            CommandExecutor.execute(configuration.callbackScript().toString());
        }
        out.println("Deployed");
    }
}
