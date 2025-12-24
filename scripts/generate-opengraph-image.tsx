#!/usr/bin/env node

/**
 * Script to generate opengraph-image.png and twitter-image.png using Next.js ImageResponse API
 *
 * This script generates identical 1200x630 images for Open Graph and Twitter social media sharing.
 * Run with: pnpm generate:opengraph
 */

import { ImageResponse } from "next/og";
import { writeFile } from "fs/promises";
import { join } from "path";

async function generateSocialImages() {
  try {
    const response = new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
            fontFamily:
              "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "60px 80px",
              textAlign: "center",
            }}
          >
            <img
              src="https://openmoji.org/data/color/svg/1F510.svg"
              alt="Lock emoji"
              width={200}
              height={200}
              style={{
                marginBottom: "28px",
                filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))",
              }}
            />
            <div
              style={{
                fontSize: "82px",
                fontWeight: "bolder",
                color: "white",
                marginBottom: "20px",
                letterSpacing: "-0.03em",
                lineHeight: "1.1",
                filter: "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.12))",
              }}
            >
              Locksmith
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                fontSize: "42px",
                color: "rgba(255, 255, 255, 1)",
                maxWidth: "800px",
                lineHeight: "1.2",
                fontWeight: "400",
                filter: "drop-shadow(0 1px 3px rgba(0, 0, 0, 0.1))",
              }}
            >
              <div>A modern Next.js starter with</div>
              <div>production-grade authentication</div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );

    // Convert the response to a buffer
    const buffer = Buffer.from(await response.arrayBuffer());

    // Write to app directory (Next.js will automatically detect and use them)
    const appDir = join(process.cwd(), "app");
    const opengraphPath = join(appDir, "opengraph-image.png");
    const twitterPath = join(appDir, "twitter-image.png");

    await writeFile(opengraphPath, buffer);
    await writeFile(twitterPath, buffer);

    console.log(
      `✅ Successfully generated opengraph-image.png at ${opengraphPath}`,
    );
    console.log(
      `✅ Successfully generated twitter-image.png at ${twitterPath}`,
    );
  } catch (error) {
    console.error("❌ Error generating social media images:", error);
    process.exit(1);
  }
}

generateSocialImages();
