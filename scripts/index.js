import { handleCssConversion } from "./cssProcessor.js";

const main = () => {
  const args = process.argv.slice(2);

  switch (true) {
    case args.length < 1:
      console.log(
        "Specify 2 args! Example: node scripts/index.js <conversion_type> <css_file>"
      );
      return;
    case args.length > 2:
      console.log(
        "Too many args! Example: node scripts/index.js <conversion_type> <css_file>"
      );
      return;
    default:
      const filename = args[1];
      const conversionType = args[0];
      const allowedConversions = ["hextorgb", "rgbtohex"];

      if (!allowedConversions.includes(conversionType)) {
        console.log(
          `[ERROR] Invalid conversion_type ${conversionType} specified, must be rgbtohex/ hextorgb`
        );
        return;
      }

      // process conversion
      handleCssConversion(filename, conversionType);
  }
};

main();
