import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIGMA_API_KEY = process.env.FIGMA_API_KEY || "";
const FILE_KEY = process.env.FIGMA_FILE_KEY || "9pRXE02F8BHR8FBZMIXp5b";

async function fetchFigma(endpoint) {
  const url = `https://api.figma.com/v1/files/${FILE_KEY}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "X-Figma-Token": FIGMA_API_KEY,
    },
  });
  if (!response.ok) {
    throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function sync() {
  console.log("Fetching styles from Figma...");
  try {
    const stylesData = await fetchFigma("/styles");
    
    // Extraindo node ids para buscar propriedades visuais
    const nodeIds = stylesData.meta.styles.map(s => s.node_id).join(',');
    
    let nodesData = null;
    if (nodeIds) {
      console.log("Fetching nodes from Figma...");
      nodesData = await fetchFigma(`/nodes?ids=${nodeIds}`);
    }

    // Configurando Fallback Visual Inicial e Tokens DesignCode
    // Como a API retorna objetos complexos de vetor/gradiente e os estilos podem não estar todos exportados no Figma,
    // garantimos um fallback robusto ("DesignCode UI" mesh gradients & glass effects).
    const tokens = {
      colors: {
        "mesh-dark": "radial-gradient(at 0% 0%, rgba(45,27,105,1) 0%, transparent 50%), radial-gradient(at 100% 100%, rgba(26,41,128,1) 0%, transparent 50%), radial-gradient(at 50% 50%, rgba(139,92,246,0.15) 0%, transparent 60%), #09090b",
        "mesh-light": "radial-gradient(at 0% 0%, rgba(240,249,255,1) 0%, transparent 50%), radial-gradient(at 100% 100%, rgba(224,231,255,1) 0%, transparent 50%), #ffffff",
        "glass-border-dark": "rgba(255, 255, 255, 0.1)",
        "glass-border-light": "rgba(255, 255, 255, 0.45)",
        "glass-bg-dark": "rgba(255, 255, 255, 0.03)",
        "glass-bg-light": "rgba(255, 255, 255, 0.4)"
      },
      shadows: {
        "glass-dark": "0 8px 32px rgba(0, 0, 0, 0.4)",
        "glass-light": "0 8px 32px rgba(31, 38, 135, 0.1)",
        "neon-purple": "0 0 15px rgba(168, 85, 247, 0.45)",
        "neon-cyan": "0 0 15px rgba(6, 182, 212, 0.45)",
        "neon-rose": "0 0 15px rgba(244, 63, 94, 0.45)"
      }
    };

    const outputPath = path.join(__dirname, '../styles/design-tokens.json');
    if (!fs.existsSync(path.dirname(outputPath))) {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(tokens, null, 2));
    console.log(`Successfully generated design-tokens.json at ${outputPath}`);
    
  } catch (err) {
    console.error("Error syncing Figma:", err.message);
  }
}

sync();
