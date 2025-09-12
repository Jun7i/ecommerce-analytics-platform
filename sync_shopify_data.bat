@echo off
echo ========================================
echo SHOPIFY DATA SYNC UTILITY
echo ========================================
echo.
echo This will sync your Shopify store data to your database.
echo Both your local frontend and Vercel deployment will be updated.
echo.

cd /d "d:\Coding\shopify\etl"

echo Running comprehensive data sync...
python sync_all_data.py

echo.
echo ========================================
echo SYNC COMPLETE!
echo ========================================
echo.
echo Your data has been updated. You can now:
echo 1. Check your local frontend at: http://localhost:5173
echo 2. Your Vercel deployment will also show the updated data
echo.
pause