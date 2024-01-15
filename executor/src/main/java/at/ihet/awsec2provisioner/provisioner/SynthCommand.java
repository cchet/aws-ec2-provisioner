package at.ihet.awsec2provisioner.provisioner;

import at.ihet.awsec2provisioner.provisioner.helper.AwsCdkExecutor;
import at.ihet.awsec2provisioner.provisioner.helper.SshKeyPairGenerator;
import jakarta.inject.Inject;

import static java.lang.System.*;
import static picocli.CommandLine.Command;
import static picocli.CommandLine.Option;

@Command(name = "synth",
        header = "Synthesizes the aws cdk infrastructure definition",
        description = "Synthesizes the aws cdk infrastructure definitions via the the aws cdk. Generates ssh-key pairs if they are not already present"
)
public class SynthCommand implements Runnable {

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
        out.println("Synthesizing...");
        sshKeyPairGenerator.generateKeyPairs(regenerateSshKeyPairs, keySize);
        awsCdkExecutor.synthesize();
        out.println("Synthesized");
    }
}
