package at.ihet.awsec2provisioner.provisioner;

import io.quarkus.picocli.runtime.annotations.TopCommand;

import static picocli.CommandLine.Command;

@TopCommand
@Command(mixinStandardHelpOptions = true,
        header = "Tool for provisioning/de-provisioning the AWS CDK Infrastructure definition.",
        subcommands = {SynthCommand.class, DeployCommand.class, DestroyCommand.class, CleanupCommand.class}
)
public class EntryCommand {

}
