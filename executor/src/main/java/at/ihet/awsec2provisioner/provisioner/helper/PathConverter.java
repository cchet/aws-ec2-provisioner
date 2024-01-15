package at.ihet.awsec2provisioner.provisioner.helper;

import org.eclipse.microprofile.config.spi.Converter;

import java.nio.file.Path;

public class PathConverter implements Converter<Path> {
    @Override
    public Path convert(String s) throws IllegalArgumentException, NullPointerException {
        return (s != null) ? Path.of(s) : null;
    }
}
