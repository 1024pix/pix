{ pkgs ? import <nixpkgs> { } }:

let
  lib = import <nixpkgs/lib>;
  buildNodeJs = pkgs.callPackage <nixpkgs/pkgs/development/web/nodejs/nodejs.nix> {
    python = pkgs.python310;
  };

  nodejsVersion = "16.19.1";

  nodejs = buildNodeJs {
    enableNpm = true;
    version = nodejsVersion;
    sha256 = "sha256-F/txZAYZgSWzDJTdPRdWIHspdwViav4W2NxHmmWh2LU=";
  };

  NPM_CONFIG_PREFIX = toString ./npm_config_prefix;

in
pkgs.mkShell {
  packages = with pkgs; [
    nodejs
  ];

  inherit NPM_CONFIG_PREFIX;

  shellHook = ''
    export PATH="${NPM_CONFIG_PREFIX}/bin:$PATH"
  '';
}
