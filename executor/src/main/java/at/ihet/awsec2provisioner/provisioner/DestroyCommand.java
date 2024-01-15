package at.ihet.awsec2provisioner.provisioner;

import at.ihet.awsec2provisioner.provisioner.helper.AwsCdkExecutor;
import jakarta.inject.Inject;

import static java.lang.System.out;
import static picocli.CommandLine.Command;

@Command(name = "destroy",
        header = "Destroys the aws cdk infrastructure definition"
)
public class DestroyCommand implements Runnable {

    @Inject
    AwsCdkExecutor awsCdkExecutor;

    @Override
    public void run() {
        out.println("Destroying...");
        awsCdkExecutor.destroy();
        out.println("Destroyed");
    }
}
