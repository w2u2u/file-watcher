import fs from 'fs';
import readline from 'readline';
import chokidar from 'chokidar';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (question: string) => new Promise((resolve) => {
  rl.question(question, (answer) => {
    resolve(answer);
  });
});

const onAdd = (path: string) => {
  // console.log('File', path, 'has been added');
};

const onChange = (path: string) => {
  // console.log('File', path, 'has been changed');
};

const onUnlink = (path: string) => {
  // console.log('File', path, 'has been removed');
};

const renameAndSave = (prefix: string) => (path: string) => {
  const splitedPath = path.split('/');
  const directory = splitedPath.slice(0, splitedPath.length - 1).join('/');
  const fileNumber = nextFileNumber(directory, prefix);
  const fileExtension = splitedPath.pop()?.split('.').pop();
  const newFileName = `${prefix}${fileNumber}`;
  const newPath = `${directory}/${newFileName}.${fileExtension}`;

  const file = fs.readFileSync(path);  
  fs.writeFileSync(newPath, file);
  fs.unlinkSync(path);

  console.log('Saved', newFileName);
};

const nextFileNumber = (directory: string, prefix: string): number => {
  const files = fs.readdirSync(directory);
  let maxSuffixNumber = 0;
  
  for (const file of files) {
    if (file.includes(prefix)) {
      const suffixNumber = parseInt(file.replace(prefix, ''));

      maxSuffixNumber = Math.max(maxSuffixNumber, suffixNumber);
    }
  }

  return maxSuffixNumber + 1;
};

(async () => {
  const targetDirectory = await askQuestion('Enter a target directory: ');
  const prefix = await askQuestion('Enter the file prefix: ');

  if (typeof targetDirectory === 'string' && typeof prefix === 'string') {
    const watcher = chokidar.watch(targetDirectory, {ignored: /^\./, persistent: true});
        
    watcher.on('add', onAdd).on('change', renameAndSave(prefix)).on('unlink', onUnlink);
  }
})();