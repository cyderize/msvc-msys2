MSVC-MSYS2 Action
=================

![build-test](https://github.com/cyderize/msvc-msys2/workflows/build-test/badge.svg)

This GitHub action sets up an MSYS2 environment with the MSVC tools and variables made available.

Its purpose is to have access to common Unix programs, but without GCC, to ensure that MSVC is always used.

## Usage

All inputs are optional, with the default values as shown:

```yaml
- uses: cyderize/msvc-msys2@v1
  with:
    # Resets path to bare minimum so that other installed tools don't interfere
    clean-path: true
    # Whether or not to run VsDevCmd.bat to setup MSVC environment
    use-msvc: true
    # Exposes the MSYS2 shell using this name for run steps
    shell-name: msys2
    # Whether or not to update MSYS2 packages (takes a long time for included msys2 due to installed packages)
    update: true
    # Version of MSYS2 to download and install
    version: latest # Version of MSYS2 to install (can also be `included` for built-in MSYS2)
- run: |
    echo "This is MSYS2"
  shell: msys2 {0}
  env:
    CLEAN_PATH: false # Overrides the clean-path setting for this step
    USE_MSVC: false # Overrides the use-msvc setting for this step
```
