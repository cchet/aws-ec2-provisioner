package at.ihet.awsec2provisioner.provisioner.helper;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class AwsCdkExecutor {

    @Inject
    Configuration configuration;

    public void synthesize() {
        CommandExecutor.execute("cdk synth");
    }

    public void deploy() {
        CommandExecutor.execute("cdk --require-approval never --outputs-file \"%s\"".formatted(configuration.infoJsonPath()));
    }

    public void destroy() {
        CommandExecutor.execute("cdk destroy --force");
    }
}
