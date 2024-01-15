package at.ihet.awsec2provisioner.provisioner.helper;

import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.Dependent;
import jakarta.json.Json;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.nio.file.Files;
import java.nio.file.Path;

@Dependent
public class Configuration {

    public int instanceCount = 0;

    @ConfigProperty(name = "configuration.dir")
    public Path configurationDir;

    @ConfigProperty(name = "out.dir")
    public Path outDir;

    public final Path cdkOutDir = Path.of("../cdk.out");

    @PostConstruct
    void init() {
        try {
            var jsonReader = Json.createReader(Files.newInputStream(configurationDir.resolve("configuration.json")));
            var jsonObject = jsonReader.readObject();
            if (jsonObject.containsKey("instance")) {
                instanceCount = jsonObject.getJsonObject("instance").getInt("count");
            } else {
                instanceCount = jsonObject.getJsonArray("instances").size();
            }
        } catch (Exception e) {
            throw new RuntimeException("Reading instanceCount from the configuration failed", e);
        }
    }

    public Path infoJsonPath(){
        return outDir.resolve("info.json");
    }
    public Path callbackScript(){
        return outDir.resolve("callback.sh");
    }
}
