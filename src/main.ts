import * as path from 'path'
import * as stream from 'stream'
import {promises as fs} from 'fs'
import * as core from '@actions/core'
import * as io from '@actions/io'
import * as toolCache from '@actions/tool-cache'
import * as exec from '@actions/exec'

async function run(): Promise<void> {
  try {
    if (process.platform !== 'win32') {
      throw {message: 'This action is only supported on Windows.'}
    }

    const tempDir = process.env['RUNNER_TEMP']
    if (!tempDir) {
      throw {message: 'RUNNER_TEMP is undefined.'}
    }

    const root = path.join(tempDir, 'msys2')
    await io.mkdirP(root)

    const version = core.getInput('version') || 'latest'
    const installDir =
      version === 'included' ? 'C:\\msys64' : path.join(root, 'msys64')
    const launcher = path.join(installDir, 'msys2_shell.cmd')

    if (version !== 'included') {
      await core.group(`Fetching MSYS2 ${version}`, async () => {
        const tarball = await toolCache.downloadTool(
          version === 'latest'
            ? 'http://repo.msys2.org/distrib/msys2-x86_64-latest.tar.xz'
            : `http://repo.msys2.org/distrib/x86_64/msys2-base-x86_64-${version}.tar.xz`
        )
        // TODO: Figure out why toolCache.extractTar doesn't work here.
        await exec.exec('C:\\msys64\\usr\\bin\\bash', [
          '-c',
          [
            '/usr/bin/tar',
            'x',
            '-C',
            `$(/usr/bin/cygpath ${JSON.stringify(root)})`,
            '-f',
            `$(/usr/bin/cygpath ${JSON.stringify(tarball)})`
          ].join(' ')
        ])
      })

      await core.group(
        'Setting up MSYS2',
        async () =>
          await exec.exec(launcher, ['-defterm', '-no-start', '-c', 'exit'])
      )
    }

    await core.group('Updating MSYS2', async () => {
      const command = 'pacman -Syuu --noconfirm --disable-download-timeout'
      const indicator = 'there is nothing to do'
      let output = ''
      const outStream = new stream.Writable({
        write(chunk, encoding, next) {
          output += chunk.toString()
          process.stdout.write(chunk)
          next()
        }
      })
      let occurrences = 0
      const maxTries = core.getInput('update').toLowerCase() === 'true' ? 5 : 0
      for (let tries = 0; tries < maxTries && occurrences < 2; tries++) {
        output = ''
        core.debug(`MSYS2 update iteration ${tries + 1}...`)
        await exec.exec(launcher, ['-defterm', '-no-start', '-c', command], {
          outStream,
          ignoreReturnCode: true
        })
        if (output.includes(indicator)) {
          occurrences++
        }
      }
    })

    const shellName = core.getInput('shell-name') || 'msys2'
    await core.group(`Making shell '${shellName} available'`, async () => {
      const shouldCleanPath =
        core.getInput('clean-path').toLowerCase() === 'true'
      const cleanedPath = process.env['PATH']
        ?.split(';')
        .filter(p => p.toLowerCase().startsWith('c:\\windows'))
        .join(';')
      const vsDevCmd =
        'C:\\Program Files (x86)\\Microsoft Visual Studio\\2019\\Enterprise\\Common7\\Tools\\VsDevCmd.bat'
      await fs.writeFile(
        path.join(root, `${shellName}.bat`),
        [
          '@echo off',
          'setlocal',
          'IF NOT DEFINED MSYS2_PATH_TYPE set MSYS2_PATH_TYPE=inherit',
          shouldCleanPath ? `set PATH=${JSON.stringify(cleanedPath)}` : '',
          `call ${JSON.stringify(vsDevCmd)} -no_logo -arch=amd64`,
          `call ${JSON.stringify(launcher)} -defterm -no-start %*`,
          'endlocal'
        ].join('\r\n')
      )
      core.addPath(root)
    })
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
