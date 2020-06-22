MSVC-MSYS2 Action
=================

![build-test](https://github.com/cyderize/msvc-msys2/workflows/build-test/badge.svg)

This GitHub action sets up an MSYS2 environment with the MSVC tools and variables made available.

Its purpose is to have access to common Unix programs, but without GCC, to ensure that MSVC is always used.

## Usage

```yaml
      - uses: cyderize/msvc-msys2@v1
        with:
          clean-path: true # Resets path to bare minimum so that other installed tools don't interfere
          shell-name: msys2 # Exposes the MSYS2 shell using this name for run steps
          update: true # Whether or not to update MSYS2 packages
          version: latest # Version of MSYS2 to install (can also be `included` for built-in MSYS2)
      - run: |
          echo "This is MSYS2"
        shell: msys2 {0}
```
